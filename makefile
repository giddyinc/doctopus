
.PHONY: test docs

clean:
	rm -rf .nyc_output coverage dist docs

lint:
	npx eslint ./lib

test:
	npx nyc --reporter=text --reporter=html --reporter=lcov gulp

docs:
	jsdoc ./lib -r
	open ./out/index.html

cov:
	npx nyc --reporter=text --reporter=html --reporter=lcov gulp test