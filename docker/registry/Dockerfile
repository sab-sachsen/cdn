FROM verdaccio/verdaccio:5.22.1
USER root

# add the config (template) file (with placeholders)
ADD config.yml /verdaccio/conf/config.tpl.yaml

# provide a custom entrypoint
COPY dockerrun.sh /opt/verdaccio/dockerrun.sh
RUN chmod +x /opt/verdaccio/dockerrun.sh 
CMD ["/opt/verdaccio/dockerrun.sh"]
