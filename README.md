# Socket.io Benchmark

## Parametres

* '-w, --worker' Nombre d'instances (process) client
* '-p, --packets' Nombre groupes de connections concurrentes
* '-c, --clients' Nombre de clients par paquets
* '-d, --debug' Logger debug
* '--help' Help

## Scenario

#### Server

* lancement du watch sur les tables BDD 'empty'/'watch' aleatoirement si au moins 1 client

* a la connection d'un user
    - requete mysql sur la table 'picture'
    - envoi des donnees existantes a l'user (~80ko)

* Le server verifie la BDD
    - requete mysql
    - envoi les infos a tous les users (~4ko)


#### Client

* pas de reconnections automatiques si echec de connection
* une fois le nombre de clients/paquets connecte au serveur, relance un paquet de connexion


### Reports

#### Server
* Nb d'users connectes max
* Temps uptime de watch (users in/out)
* Nb de messages envoyes (update/connection)
* max memory usage (users in/out | heapTotal and heapUsed refer to V8's memory usage)

## History

* v0.1.0

