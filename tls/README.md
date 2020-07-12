# How to generate TLS certificate and make chome accept it

@see https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate



## CA

1. generating CA key

```sh
openssl genpkey \
    -algorithm EC \
    -pkeyopt ec_paramgen_curve:P-256 \
    > ca_key.pem
```


1. generating CA cert

```sh
openssl req -x509 -new -nodes \
    -key ca_key.pem \
    -sha256 -days 3650 \
    -out ca_cert.pem \
    -subj "/O=MY CA ***** REMOVED IF UNNECESSARY ***** /CN=MY_CA"
```

1. checking generated CA cert

```sh
openssl x509 -noout -text -in ca_cert.pem 
```

1. installing ca_cert.pem to chrome browser

- open `chrome://settings/certificates` in chrome.
- click `Authorities` tab.
- click `import` button.
- specify and import CA cert.



## server

1. declaring host name

```sh
NAME=localhost
```

1. generating localhost key

```sh
openssl genpkey \
    -algorithm EC \
    -pkeyopt ec_paramgen_curve:P-256 \
    > ${NAME}_key.pem
```

1. generating SRL

```sh
openssl req -new \
    -key ${NAME}_key.pem \
    -out ${NAME}.csr \
    -subj "/O=${NAME} /CN=${NAME}"
```

1. creating extension file

```sh
cat <<EOF > ${NAME}.ext
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = ${NAME}

# optional entries
# DNS.2 = foo.$NAME
# IP.1 = 192.168.0.200
# IP.2 = 192.168.0.201
EOF
```

1. generate localhost cert

```sh
openssl x509 -req \
    -in ${NAME}.csr \
    -CA ca_cert.pem \
    -CAkey ca_key.pem \
    -CAcreateserial \
    -out ${NAME}_crt.pem \
    -days 3650 \
    -sha256 \
    -extfile ${NAME}.ext
```