UGLIFYJS=./node_modules/.bin/uglifyjs
UGLIFYJS_FLAGS=-c -m

EXPORT_NAME='Yammer'
BROWSERIFY=./node_modules/.bin/browserify
BROWSERIFY_FLAGS=-s $(EXPORT_NAME)

SOURCE_DIR=./lib
TARGET_DIR=./dist

all: clean $(TARGET_DIR)/yammer_api_client.min.js

install:
	npm install

clean:
	@rm -Rf $(TARGET_DIR)

$(TARGET_DIR)/%.min.js: $(TARGET_DIR)/%.js
	cp $? $@
	#$(UGLIFYJS) $? -o $@ $(UGLIFYJS_FLAGS)

$(TARGET_DIR)/%.js: $(SOURCE_DIR)/%.js | $(TARGET_DIR)
	$(BROWSERIFY) $(BROWSERIFY_FLAGS) -e $< -o $@

$(TARGET_DIR):
	@mkdir -p $(TARGET_DIR)

watch:
	watchman watch $(shell pwd)
	watchman -- trigger $(shell pwd) remake '*.js' -- make

.PHONY: all install clean

