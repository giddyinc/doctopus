
.PHONY: test docs

clean:
	rm -rf .nyc_output coverage dist docs

lint:
	./node_modules/.bin/eslint ./lib

test: lint
	./node_modules/.bin/gulp

docs:
	jsdoc ./lib -r
	open ./out/index.html