#!/bin/bash

# H3 Network Platform - Comprehensive Test Runner
# This script runs all tests in the correct order and provides detailed reporting

set -e  # Exit on any error

echo "🚀 H3 Network Platform - Comprehensive Testing Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TEST_RESULTS=()

# Function to run a test and capture results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_description="$3"
    
    echo ""
    echo -e "${BLUE}🧪 Running: $test_name${NC}"
    echo "   Description: $test_description"
    echo "   Command: $test_command"
    echo "   ----------------------------------------"
    
    start_time=$(date +%s)
    
    if eval "$test_command"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${GREEN}✅ PASSED${NC} ($duration seconds)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        TEST_RESULTS+=("✅ $test_name - PASSED ($duration s)")
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${RED}❌ FAILED${NC} ($duration seconds)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        TEST_RESULTS+=("❌ $test_name - FAILED ($duration s)")
    fi
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-flight checks
echo ""
echo -e "${YELLOW}🔍 Pre-flight Checks${NC}"
echo "========================"

# Check if required tools are installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists npx; then
    echo -e "${RED}❌ npx is not available${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is available${NC}"
echo -e "${GREEN}✅ npx is available${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run from project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ package.json found${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Dependencies are ready${NC}"

# Phase 1: Linting and Code Quality
echo ""
echo -e "${BLUE}📋 Phase 1: Code Quality Checks${NC}"
echo "================================="

run_test "ESLint" \
    "npx eslint . --ext .ts,.tsx --max-warnings 0" \
    "Check code style and catch potential errors"

run_test "TypeScript Type Check" \
    "npx tsc --noEmit" \
    "Verify TypeScript types are correct"

run_test "Prettier Format Check" \
    "npx prettier --check ." \
    "Verify code formatting is consistent"

# Phase 2: Unit Tests
echo ""
echo -e "${BLUE}🧪 Phase 2: Unit Tests${NC}"
echo "========================"

run_test "Component Unit Tests" \
    "npx vitest run __tests__/components --reporter=verbose" \
    "Test individual React components in isolation"

run_test "API Route Unit Tests" \
    "npx vitest run __tests__/api --reporter=verbose" \
    "Test API endpoints and server-side logic"

run_test "Utility Function Tests" \
    "npx vitest run __tests__/lib --reporter=verbose" \
    "Test helper functions and utilities"

# Phase 3: Integration Tests
echo ""
echo -e "${BLUE}🔗 Phase 3: Integration Tests${NC}"
echo "=============================="

run_test "Database Integration" \
    "npx vitest run __tests__/integration/database --reporter=verbose" \
    "Test database operations and Prisma queries"

run_test "API Integration" \
    "npx vitest run __tests__/integration/api --reporter=verbose" \
    "Test API routes with database interactions"

run_test "Authentication Flow" \
    "npx vitest run __tests__/integration/auth --reporter=verbose" \
    "Test user authentication and session management"

# Phase 4: End-to-End Tests
echo ""
echo -e "${BLUE}🌐 Phase 4: End-to-End Tests${NC}"
echo "============================"

# Install Playwright if not already installed
if ! npx playwright --version >/dev/null 2>&1; then
    echo -e "${YELLOW}📥 Installing Playwright...${NC}"
    npx playwright install
fi

run_test "Analytics Dashboard E2E" \
    "npx playwright test __tests__/e2e/analytics.spec.ts --reporter=line" \
    "Test complete analytics dashboard workflow"

run_test "Creator Dashboard E2E" \
    "npx playwright test __tests__/e2e/creator.spec.ts --reporter=line" \
    "Test creator dashboard and content management"

run_test "Authentication E2E" \
    "npx playwright test __tests__/e2e/auth.spec.ts --reporter=line" \
    "Test login/logout and user management flows"

# Phase 5: Performance Tests
echo ""
echo -e "${BLUE}⚡ Phase 5: Performance Tests${NC}"
echo "============================="

run_test "Bundle Size Analysis" \
    "npx next build && npx bundlesize" \
    "Check JavaScript bundle sizes are within limits"

run_test "Lighthouse Performance" \
    "npx lighthouse http://localhost:3000 --chrome-flags='--headless' --output=json --quiet" \
    "Measure web performance metrics"

# Phase 6: Security Tests
echo ""
echo -e "${BLUE}🔒 Phase 6: Security Tests${NC}"
echo "=========================="

run_test "Dependency Vulnerability Scan" \
    "npm audit --audit-level moderate" \
    "Check for known security vulnerabilities in dependencies"

run_test "Static Security Analysis" \
    "npx eslint-plugin-security" \
    "Analyze code for potential security issues"

# Phase 7: Accessibility Tests
echo ""
echo -e "${BLUE}♿ Phase 7: Accessibility Tests${NC}"
echo "==============================="

run_test "Axe Accessibility Check" \
    "npx axe-cli http://localhost:3000 --tags wcag2a,wcag2aa" \
    "Check WCAG accessibility compliance"

# Generate Test Report
echo ""
echo ""
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "========================"

total_tests=$((TESTS_PASSED + TESTS_FAILED))
pass_rate=$(( (TESTS_PASSED * 100) / total_tests ))

echo "Total Tests: $total_tests"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Pass Rate: ${BLUE}$pass_rate%${NC}"

echo ""
echo "Detailed Results:"
echo "-----------------"
for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
done

# Generate badges and reports
echo ""
echo -e "${BLUE}📈 Generating Reports${NC}"
echo "====================="

# Create test report directory
mkdir -p reports

# Generate coverage report
echo "Generating coverage report..."
npx vitest run --coverage --reporter=html --coverage.reportsDirectory=reports/coverage

# Generate test results JSON
cat > reports/test-results.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total": $total_tests,
  "passed": $TESTS_PASSED,
  "failed": $TESTS_FAILED,
  "passRate": $pass_rate,
  "results": [
$(IFS=$'\n'; printf '    "%s"' "${TEST_RESULTS[*]}" | sed 's/$/,/' | sed '$s/,$//')
  ]
}
EOF

echo -e "${GREEN}✅ Test report generated: reports/test-results.json${NC}"
echo -e "${GREEN}✅ Coverage report generated: reports/coverage/index.html${NC}"

# Final result
echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your code is ready for production.${NC}"
    exit 0
else
    echo -e "${RED}💥 $TESTS_FAILED test(s) failed. Please fix the issues before deploying.${NC}"
    exit 1
fi