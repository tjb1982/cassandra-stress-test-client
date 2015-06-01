(defproject automatic-stress-client "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [compojure "1.3.4"]
                 [hiccup "1.0.5"]
                 [ring "1.4.0-RC1"]
                 [automatic-stress "0.1.0-SNAPSHOT"]
                 [org.clojure/data.json "0.2.6"]
                 [clj-yaml "0.4.0"]
                 [com.datastax.cassandra/cassandra-driver-core "2.1.6"]
                ]
  :main ^:skip-aot automatic-stress-client.core
  :target-path "target/%s"

  :plugins [[lein-ring "0.9.4"]]
  :ring {:handler automatic-stress-client.core/app}

  :profiles {:uberjar {:aot :all}})
