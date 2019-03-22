# bmvi-data-run-2019

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9229df6ba09e4da3b7a51503f0746be5)](https://app.codacy.com/app/felix.erdmann/bmvi-data-run-2019?utm_source=github.com&utm_medium=referral&utm_content=Sijoma/bmvi-data-run-2019&utm_campaign=Badge_Grade_Dashboard)

### How to run?

```
docker-compose up
```

When mock script elapsed:
Open new terminal tab / window and:

```
docker-compose up mock
```

---

#### Using:

- tile38 database
- node.js server (express, socket.io)
- simple frontend with socket.io connection
- python script to mock data movement

---

#### Limitations:

- tile38
  - you can only create hooks with specified bounds / points / polygons, not for collections
