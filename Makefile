ROOT_DIR	:= $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
NOW		:= $(shell date --iso=seconds)
SRC_DIR 	:= $(ROOT_DIR)/src
BUILD_DIR 	:= $(ROOT_DIR)/build
JS_DEBUG 	:= $(BUILD_DIR)/ol3-geocoder-debug.js
JS_FINAL 	:= $(BUILD_DIR)/ol3-geocoder.js
CSS_COMBINED 	:= $(BUILD_DIR)/ol3-geocoder.css
CSS_FINAL 	:= $(BUILD_DIR)/ol3-geocoder.min.css
TMPFILE 	:= $(BUILD_DIR)/tmp
PACKAGE_JSON 	:= $(ROOT_DIR)/package.json
LAST_VERSION	:= $(shell cat $(PACKAGE_JSON) | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin').toString()).version")

JS_FILES 	:= $(SRC_DIR)/wrapper-head.js \
		   $(SRC_DIR)/base.js \
		   $(SRC_DIR)/nominatim.js \
		   $(SRC_DIR)/utils.js \
		   $(SRC_DIR)/wrapper-tail.js

CSS_FILES 	:= $(SRC_DIR)/ol3-geocoder.css

CLEANCSS 	:= ./node_modules/.bin/cleancss
CLEANCSSFLAGS 	:= --skip-restructuring
POSTCSS 	:= ./node_modules/.bin/postcss
POSTCSSFLAGS 	:= --use autoprefixer -b "last 2 versions"
JSHINT 		:= ./node_modules/.bin/jshint
UGLIFYJS 	:= ./node_modules/.bin/uglifyjs
UGLIFYJSFLAGS 	:= --mangle --mangle-regex --screw-ie8 --lint -c warnings=true
JS_BEAUTIFY	:= ./node_modules/.bin/js-beautify
BEAUTIFYFLAGS 	:= -f - --indent-size 2 --preserve-newlines
NODEMON 	:= ./node_modules/.bin/nodemon
PARALLELSHELL 	:= ./node_modules/.bin/parallelshell

# just to create variables like NODEMON_JS_FLAGS when called
define NodemonFlags
	UP_LANG = $(shell echo $(1) | tr '[:lower:]' '[:upper:]')
	NODEMON_$$(UP_LANG)_FLAGS := --on-change-only --watch "$(SRC_DIR)" --ext "$(1)" --exec "make build-$(1)"
endef

define HEADER
// Geocoder Nominatim for OpenLayers 3.
// https://github.com/jonataswalker/ol3-geocoder
// Version: v$(LAST_VERSION)
// Built: $(NOW)

endef
export HEADER

# targets
build-watch: build watch

watch:
	$(PARALLELSHELL) "make watch-js" "make watch-css"

build: build-js build-css

build-js: combine-js jshint uglifyjs addheader
	@echo "Build JS ... OK"

build-css: combine-css cleancss
	@echo "Build CSS ... OK"

uglifyjs: $(JS_DEBUG)
	@$(UGLIFYJS) $^ $(UGLIFYJSFLAGS) > $(JS_FINAL)

jshint: $(JS_DEBUG)
	@$(JSHINT) $^

addheader-debug: $(JS_DEBUG)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

addheader-min: $(JS_FINAL)
	@echo "$$HEADER" | cat - $^ > $(TMPFILE) && mv $(TMPFILE) $^

addheader: addheader-debug addheader-min

cleancss: $(CSS_COMBINED)
	@cat $^ | $(CLEANCSS) $(CLEANCSSFLAGS) > $(CSS_FINAL)

combine-js: $(JS_FILES)
	@cat $^ | $(JS_BEAUTIFY) $(BEAUTIFYFLAGS) > $(JS_DEBUG)

combine-css: $(CSS_FILES)
	@cat $^ | $(POSTCSS) $(POSTCSSFLAGS) > $(CSS_COMBINED)

watch-js: $(JS_FILES)
	$(eval $(call NodemonFlags,js))
	@$(NODEMON) $(NODEMON_JS_FLAGS)

watch-css: $(CSS_FILES)
	$(eval $(call NodemonFlags,css))
	@$(NODEMON) $(NODEMON_CSS_FLAGS)
	
.DEFAULT_GOAL := build
