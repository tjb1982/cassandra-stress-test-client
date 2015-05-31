(ns automatic-stress-client.models
  (:import (com.datastax.driver.core BoundStatement)
           )
  (:require [automatic-stress.core :refer [run-test deserialize-value]]
    ))

(defn get-all-iterations
  [session keyspace]
  (try
    (map
     (fn [row] (str (-> row (.getUUID "iteration") str)))
     (-> session
       (.execute (str "select * from " keyspace ".iterations;"))
       .all))
    (catch Exception e
      [])))

(defn get-iteration
  [session keyspace iteration]
  (let [attributes (-> session
                     (.execute (str "select attributes from " keyspace ".iterations where iteration = " iteration))
                     .all first (.getSet "attributes" String))]
    (for [attr attributes]
      (let [attr (-> attr (clojure.string/split #" "))
            object-name (first attr)
            attribute (second attr)]
        {:object-name object-name
         :attribute attribute
         :data
         (map
           (fn [row]
             {:value (-> (-> row (.getBytes "value")) .array deserialize-value)
              :received (-> row (.getDate "received") .getTime)})
           (-> session
             (.execute (str
                         "select * from " keyspace ".attributes "
                         "where iteration = " iteration
                         " and object_name = '" object-name
                         "' and attribute = '" attribute "'"))
             .all))}))))
