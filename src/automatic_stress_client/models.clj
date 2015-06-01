(ns automatic-stress-client.models
  (:import (com.datastax.driver.core BoundStatement)
           )
  (:require [automatic-stress.core :as stress]
            [clj-yaml.core :as yaml]
    ))

(defn get-all-iterations
  [session keyspace]
  (try
    (map
     (fn [row] {:iteration (-> row (.getUUID "iteration") str)
                :run-date (-> row (.getDate "run_date") .getTime)})
     (-> session
       (.execute (str "select * from " keyspace ".iterations;"))
       .all))
    (catch Exception e
      [])))

(defn get-attributes
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
             {:value (-> (-> row (.getBytes "value")) .array stress/deserialize-value)
              :received (-> row (.getDate "received") .getTime)})
           (-> session
             (.execute (str
                         "select * from " keyspace ".attributes "
                         "where iteration = " iteration
                         " and object_name = '" object-name
                         "' and attribute = '" attribute "'"))
             .all))}))))

(defn run-test
  [properties]
  (let [properties (yaml/parse-string properties)]
    (stress/run-test
      (assoc
        properties
        :test-invocation
        "/home/tjb1982/nclk/them/datastax/apache-cassandra-2.0.15/tools/bin/cassandra-stress"))))

