#!/bin/sh

# replace the default config file and parse it
rm -f /verdaccio/conf/config.yaml
eval "echo \"$(cat /verdaccio/conf/config.tpl.yaml)\"" > /verdaccio/conf/config.yaml

# run the default command
/bin/sh -c verdaccio --config
