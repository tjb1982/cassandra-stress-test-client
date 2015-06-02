(ns automatic-stress-client.core
  (:use compojure.core
        [ring.adapter.jetty :only (run-jetty)]
        [hiccup.middleware :only (wrap-base-url)])
  (:import (com.datastax.driver.core Cluster
                                     BoundStatement)
           (com.datastax.driver.core.exceptions NoHostAvailableException))
  (:require [compojure.route :as route]
            [compojure.handler :as handler]
            [compojure.response :as response]
            [clojure.data.json :as json]
            [automatic-stress-client.views :as views]
            [automatic-stress-client.models :as models]
    ))

(def ^:dynamic cluster nil)

(def ^:dynamic session nil)

(defroutes api
  (context "/api" []
    (GET "/iteration/:iteration" request
      {:status 200
       :headers {"Content-Type" "application/json"}
       :body (json/write-str
               (models/get-attributes
                 session
                 (-> request :params :keyspace)
                 (-> request :params :iteration)))})
    (GET "/iterations" request
      {:status 200
       :headers {"Content-Type" "application/json"}
       :body (json/write-str
               (models/get-all-iterations
                 session
                 (-> request :params :keyspace)))})
    (POST "/run-test" request
      (future (models/run-test (slurp (-> request :body))))
      {:status 201
       :headers {"Content-Type" "application/json"}
       :body (json/write-str {:message "running"})})
    ))

(defroutes main-routes
  (GET "/" [] (views/index 
                (slurp
                  (clojure.java.io/file
                    (clojure.java.io/resource "properties.yaml")))))
  api
  (route/resources "/")
  (route/not-found "Page not found"))

(defn init []
  (alter-var-root #'cluster (fn [_] 
    (-> (Cluster/builder) (.addContactPoint "localhost") .build)))
  (alter-var-root #'session (fn [_] 
    (-> cluster .connect))))

(def app
    (-> (handler/site main-routes)
        (wrap-base-url)))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (init)
  (run-jetty #'app {:port 3000 :join? false}))
