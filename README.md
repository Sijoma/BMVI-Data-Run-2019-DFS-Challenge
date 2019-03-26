# bmvi-data-run-2019

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9229df6ba09e4da3b7a51503f0746be5)](https://app.codacy.com/app/felix.erdmann/bmvi-data-run-2019?utm_source=github.com&utm_medium=referral&utm_content=Sijoma/bmvi-data-run-2019&utm_campaign=Badge_Grade_Dashboard)

This project was developed during BMVI Data-Run 2019 and was the winner project of the DFS Challenge. More infos here: https://www.bmvi.de/SharedDocs/DE/Artikel/DG/preistraeger-datarun-2019.html

### How to run?

Add the following files to `server/assets/geojsons`:
```
airports_DFS.json
airspaces_DFS.json
windmills_DFS.json
```

Now build and run the application with

```
docker-compose up
```

---

#### Using:

- tile38 database
- node.js server
- simple frontend with leaflet map
