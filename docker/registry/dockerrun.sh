#!/bin/sh

# replace the default config file and parse it
mv /verdaccio/conf/config.yaml /verdaccio/conf/config.default.yaml
eval "echo \"$(cat /verdaccio/conf/config.template.yaml)\"" > /verdaccio/conf/config.yaml
echo "Expanded config file"

# run the default command
verdaccio --config /verdaccio/conf/config.yaml --listen $VERDACCIO_PROTOCOL://0.0.0.0:$VERDACCIO_PORT
