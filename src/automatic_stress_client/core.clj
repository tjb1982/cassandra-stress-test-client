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

(defonce cluster
  (-> (Cluster/builder) (.addContactPoint "localhost") .build))

(defonce session
  (-> cluster .connect))

(defroutes api
  (context "/api" []
    (GET "/iteration/:iteration" request
      {:status 200
       :headers {"Content-Type" "application/json"}
       :body (json/write-str
               (models/get-iteration
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
    ))

(defroutes main-routes
  (GET "/" [] (views/index))
  api
  (route/resources "/")
  (route/not-found "Page not found"))

(def app
  (-> (handler/site main-routes)
      (wrap-base-url)))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (run-jetty #'app {:port 3000 :join? false}))
