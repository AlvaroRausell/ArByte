# ArByte
[![alt text](https://imgur.com/nGqVNBu.png)](https://devpost.com/software/arbyte)



### Reinventing Cloud Storage and Collaboration
Server and Client nodejs server which allows to share and update directories in LAN or through tunneling.

Entry for [ICHack19](https://ichack.org/) |||  [Devpost](https://devpost.com/software/arbyte)




The server is meant to run on a RaspberryPi, and allows the users running the client.js to share files between themselves without having to rely on external Cloud Storage services.

The server dynamically mounts and unmounts storage devices and shares them with authorised devices over LAN or, if in different networks, through HTTP tunnels.

A cheap way to have your own "Cloudless" Cloud Storage.

---

to run server
```
sudo node server.js
```


to run clients
```
sudo node client.js
```

---

### ⚠WARNING⚠

This build is highly unstable as it was developed in 24 hours.

All the developers were high on ☕☕ caffeine ☕☕ and barely made it out alive.

Use at your own risk.

###### (Almost) No front-end developers were hurt during the development process.
