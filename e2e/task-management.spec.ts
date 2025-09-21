import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new task', async ({ page }) => {
    // Click new task button
    await page.click('[data-testid="new-task-button"]');
    
    // Fill out the form
    await page.fill('[data-testid="task-title"]', 'Test Task');
    await page.fill('[data-testid="task-description"]', 'This is a test task');
    await page.selectOption('[data-testid="task-priority"]', 'high');
    
    // Submit the form
    await page.click('[data-testid="create-task-button"]');
    
    // Verify task was created
    await expect(page.locator('text=Test Task')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Original Task');
    await page.click('[data-testid="create-task-button"]');
    
    // Edit the task
    await page.click('[data-testid="edit-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Updated Task');
    await page.click('[data-testid="update-task-button"]');
    
    // Verify task was updated
    await expect(page.locator('text=Updated Task')).toBeVisible();
    await expect(page.locator('text=Original Task')).not.toBeVisible();
  });

  test('should mark task as complete', async ({ page }) => {
    // Create a task first
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Complete Me');
    await page.click('[data-testid="create-task-button"]');
    
    // Mark as complete
    await page.click('[data-testid="task-checkbox"]');
    
    // Verify task is marked as complete
    await expect(page.locator('[data-testid="task-card"]')).toHaveClass(/opacity-60/);
  });

  test('should filter tasks by status', async ({ page }) => {
    // Create completed task
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Completed Task');
    await page.click('[data-testid="create-task-button"]');
    await page.click('[data-testid="task-checkbox"]');
    
    // Create pending task
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Pending Task');
    await page.click('[data-testid="create-task-button"]');
    
    // Filter by completed
    await page.click('text=Completed');
    await expect(page.locator('text=Completed Task')).toBeVisible();
    await expect(page.locator('text=Pending Task')).not.toBeVisible();
  });

  test('should search tasks', async ({ page }) => {
    // Create tasks
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Important Meeting');
    await page.click('[data-testid="create-task-button"]');
    
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Buy Groceries');
    await page.click('[data-testid="create-task-button"]');
    
    // Search for "meeting"
    await page.fill('[data-testid="search-input"]', 'meeting');
    await expect(page.locator('text=Important Meeting')).toBeVisible();
    await expect(page.locator('text=Buy Groceries')).not.toBeVisible();
  });
});