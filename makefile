
.PHONY: test docs

clean:
	rm -rf .nyc_output coverage dist docs

lint:
	./node_modules/.bin/eslint ./lib

test:
	./node_modules/.bin/nyc --reporter=text --reporter=html --reporter=lcov ./node_modules/.bin/gulp

docs:
	jsdoc ./lib -r
	open ./out/index.html

cov:
	./node_modules/.bin/nyc --reporter=text --reporter=html --reporter=lcov gulp test