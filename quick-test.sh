#!/bin/bash

# Quick Test Demo - Runs a subset of tests to demonstrate functionality
echo "🚀 H3 Network Platform - Quick Test Demo"
echo "========================================"

# Install required testing dependencies if not present
echo "📦 Installing test dependencies..."
npm install --save-dev \
  vitest \
  @vitest/ui \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @playwright/test \
  axe-playwright

echo ""
echo "🧪 Running Component Tests..."
echo "=============================="

# Run our analytics component test
npx vitest run __tests__/components/AdvancedAnalytics.test.tsx --reporter=verbose

echo ""
echo "🌐 Running API Tests..."
echo "======================="

# Run our API route test
npx vitest run __tests__/api/creator/analytics.test.ts --reporter=verbose

echo ""
echo "📊 Test Coverage Report"
echo "======================="

# Generate coverage report
npx vitest run --coverage --reporter=text

echo ""
echo "✅ Quick test demo complete!"
echo ""
echo "To run all tests: ./test-all.sh"
echo "To run specific tests:"
echo "  - Components: npx vitest __tests__/components"
echo "  - API Routes: npx vitest __tests__/api"
echo "  - E2E Tests: npx playwright test"
echo ""
echo "📈 View detailed reports in the 'reports/' directory"