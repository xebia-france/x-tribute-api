![CI](https://github.com/xebia-france/x-tribute-api/workflows/CI/badge.svg)

# X-Tribute API

## Stack

API uses Serverless + Amazon Web Services Lambda + TypeScript (and Jest for testing).

## How to run locally

You have to install Serverless first:

````shell script
npm i -g serverless
````

Then you can start functions locally:

```shell script
npm run start:offline
```

Call functions:

### POST thanks

```shell script
curl -X POST -d '{"text": "thank you", "author": {"name": "John D", "email": "jd@xebia.fr"}, "recipient": {"name": "Doe J", "email": "dj@xebia.fr"}}' http://localhost:3000/dev/thanks
```

Response:
````json
{"id":"xxx"}
````

### GET thanks

```shell script
curl http://localhost:3000/dev/thanks
```

Response:
```json
[
  {
    "id": "xxx",
    "author": {
      "name": "John D",
      "email": "jd@xebia.fr"
    },
    "text": "Thank you",
    "recipient": {
      "email": "dj@xebia.fr",
      "name": "Doe J"
    },
    "status": 0
  }
]
```
