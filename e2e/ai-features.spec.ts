import { test, expect } from '@playwright/test';

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate AI task suggestions', async ({ page }) => {
    // Mock AI API response
    await page.route('/api/ai/suggest', async route => {
      const suggestions = [
        {
          title: 'Plan project timeline',
          description: 'Create detailed project timeline with milestones',
          priority: 'high',
          tags: ['planning', 'project'],
          estimatedDuration: '2 hours'
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, suggestions })
      });
    });

    // Click AI suggest button
    await page.click('text=AI Suggest');
    
    // Enter prompt
    await page.fill('[data-testid="ai-prompt"]', 'I need to organize my work project');
    await page.click('[data-testid="generate-suggestions"]');
    
    // Verify suggestion appears
    await expect(page.locator('text=Plan project timeline')).toBeVisible();
    
    // Select and create suggestion
    await page.click('[data-testid="suggestion-0"]');
    await page.click('[data-testid="create-selected-tasks"]');
    
    // Verify task was created
    await expect(page.locator('text=Plan project timeline')).toBeVisible();
  });

  test('should summarize task description', async ({ page }) => {
    // Mock AI API response
    await page.route('/api/ai/summarize', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          summary: 'Organize project with timeline and milestones.' 
        })
      });
    });

    // Create task with long description
    await page.click('[data-testid="new-task-button"]');
    await page.fill('[data-testid="task-title"]', 'Project Organization');
    await page.fill('[data-testid="task-description"]', 
      'This is a very long description that needs to be organized. ' +
      'It includes multiple aspects of the project including timeline, ' +
      'resource allocation, milestone tracking, and team coordination.'
    );
    
    // Click AI summarize button
    await page.click('text=AI Summarize');
    
    // Verify description was summarized
    await expect(page.locator('[data-testid="task-description"]'))
      .toHaveValue('Organize project with timeline and milestones.');
  });

  test('should handle AI service failures gracefully', async ({ page }) => {
    // Mock AI API failure
    await page.route('/api/ai/suggest', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI service unavailable' })
      });
    });

    // Click AI suggest button
    await page.click('text=AI Suggest');
    
    // Enter prompt
    await page.fill('[data-testid="ai-prompt"]', 'Help me with tasks');
    await page.click('[data-testid="generate-suggestions"]');
    
    // Verify fallback suggestions appear
    await expect(page.locator('text=Plan:')).toBeVisible();
  });
});