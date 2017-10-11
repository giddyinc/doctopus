
.PHONY: test

clean:
	rm -rf .nyc_output coverage dist

lint:
	./node_modules/.bin/eslint ./lib

test: lint
	./node_modules/.bin/gulp