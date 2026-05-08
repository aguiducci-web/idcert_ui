REGISTRY = http://localhost:4873/

publish:
	@echo "Publishing package..."
	@pnpm -r --filter @idcert/ui --filter @idcert/tokens --filter @idcert/tailwind-config exec pnpm publish --registry $(REGISTRY) --access public
	@echo "Package published successfully!"