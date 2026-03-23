## UI-Test Worker
Ein Worker, der Jobs aus der Status-Queue von BullMQ nimmt und an RabbitMQ weiterleitet.

Der Worker sucht nach Jobs in der angegebenen Queue (`QUEUE_NAME_INPUT`) und leitet diese an die RabbitMQ (`QUEUE_NAME_OUTPUT`) weiter.

Er erwartet das folgende Eingabeformat (als `data`-Feld des Jobs):
```
{
    "id": id-des-jobs,
    "status": "NEUER_STATUS",
}
```


### Nutzen der Anwendung

Am einfachsten ist es, die Anwendung mithilfe der übergeordneten docker-compose Datei zu nutzen.
Ansonsten kann die Anwendung aber auch wie folgt genutzt werden:

#### Umgebungsvariablen
| Name              | Beschreibung                                                                       |                   Default |
|:------------------|------------------------------------------------------------------------------------|--------------------------:|
| REDIS_HOST        | Adresse, unter der Redis erreichbar ist                                            |                     redis | 
| REDIS_PORT        | Port, unter der Redis erreichbar ist                                               |                      6379 | 
| RABBITMQ_HOST     | Adresse, unter der RabbitMQ erreichbar ist                                         |                    rabbit | 
| RABBITMQ_PORT     | Port, unter dem RabbitMQ erreichbar ist                                            |                      5672 | 
| RABBITMQ_USER     | Nutzername, mit dem sich mit der RabbitMQ verbunden wird                           |                      5672 | 
| RABBITMQ_PASSWORD | Password des Nutzers                                                               |                      5672 | 
| QUEUE_NAME_INPUT  | Name der BullMQ-Redis-Queue, die von dem Worker bearbeitet wird                    | EcoDigitJobsStatusUpdates |
| QUEUE_NAME_OUTPUT | Name der RabbitMQ-Queue, an die die Statusnachrichten weitergeleitet werden sollen |      EcoDigitJobsAnalyzer |

