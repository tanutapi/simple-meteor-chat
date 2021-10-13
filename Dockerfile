# abernix/meteord is not working anymore
# FROM abernix/meteord:node-12-onbuild

# Using zodern/meteor
# meteor build ../output
FROM zodern/meteor:root
COPY --chown=app:app ../output/simple-meteor-chat.tar.gz /bundle/bundle.tar.gz
