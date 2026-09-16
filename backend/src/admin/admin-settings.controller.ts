import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureFlagsService } from '../features/feature-flags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/settings')
@ApiTags('Admin Settings')
export class AdminSettingsController {
  constructor(private featureFlags: FeatureFlagsService) {}

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get all feature flags grouped by category' })
  @ApiResponse({ status: 200, description: 'Feature flags grouped by category' })
  async getFeatureFlags() {
    const allFlags = await this.featureFlags.getAllFlags();

    const grouped = {
      payments: allFlags.filter((f) => f.category === 'payments'),
      seller: allFlags.filter((f) => f.category === 'seller'),
      buyer: allFlags.filter((f) => f.category === 'buyer'),
      admin: allFlags.filter((f) => f.category === 'admin'),
      total_enabled: allFlags.filter((f) => f.enabled).length,
      total_flags: allFlags.length,
      last_updated: new Date(),
    };

    return grouped;
  }

  @Post('feature-flags/:flagName/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle a feature flag on or off' })
  @ApiResponse({
    status: 200,
    description: 'Feature flag toggled successfully',
  })
  async toggleFlag(
    @Param('flagName') flagName: string,
    @Body() { enabled }: { enabled: boolean },
  ) {
    const success = await this.featureFlags.toggleFlag(flagName, enabled);

    if (!success) {
      return {
        status: 'error',
        message: 'Failed to toggle feature flag',
      };
    }

    return {
      status: 'updated',
      flagName,
      enabled,
      message: enabled ? 'Feature enabled' : 'Feature disabled',
      timestamp: new Date(),
    };
  }

  @Post('feature-flags/batch-toggle')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle all flags in a category' })
  @ApiResponse({ status: 200, description: 'Category flags toggled' })
  async batchToggle(
    @Body() { category, enabled }: { category: string; enabled: boolean },
  ) {
    const count = await this.featureFlags.batchToggleCategory(category, enabled);

    return {
      status: 'updated',
      category,
      enabled,
      count,
      message: `${count} features in '${category}' category ${enabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date(),
    };
  }

  @Get('feature-flags/category/:category')
  @ApiOperation({ summary: 'Get feature flags for a specific category' })
  async getFlagsByCategory(@Param('category') category: string) {
    const flags = await this.featureFlags.getFlagsByCategory(category);

    return {
      category,
      flags,
      count: flags.length,
      enabled_count: flags.filter((f) => f.enabled).length,
    };
  }

  @Get('feature-flags/check/:flagName')
  @ApiOperation({ summary: 'Check if a feature flag is enabled' })
  async checkFlag(@Param('flagName') flagName: string) {
    const enabled = await this.featureFlags.getFlag(flagName);

    return {
      flagName,
      enabled,
      timestamp: new Date(),
    };
  }

  @Post('feature-flags/cache-clear')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Clear feature flags cache' })
  async clearCache() {
    this.featureFlags.clearCache();

    return {
      status: 'cache_cleared',
      message: 'Feature flags cache has been cleared',
      timestamp: new Date(),
    };
  }
}
