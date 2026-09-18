import { Injectable } from '@nestjs/common';

interface AuditIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

interface AuditResult {
  score: number;
  issues: AuditIssue[];
  recommendations: string[];
}

@Injectable()
export class SeoAuditService {
  auditListing(listing: any): AuditResult {
    const issues: AuditIssue[] = [];
    let score = 100;

    // Audit title
    if (!listing.title) {
      issues.push({
        type: 'missing_title',
        severity: 'critical',
        message: 'Listing has no title',
        recommendation: 'Add a descriptive title (30-60 characters)',
      });
      score -= 20;
    } else if (listing.title.length < 10) {
      issues.push({
        type: 'short_title',
        severity: 'warning',
        message: `Title is too short (${listing.title.length} chars)`,
        recommendation: 'Expand title to at least 10 characters',
      });
      score -= 10;
    } else if (listing.title.length > 60) {
      issues.push({
        type: 'long_title',
        severity: 'warning',
        message: `Title is too long (${listing.title.length} chars, recommended max 60)`,
        recommendation: 'Shorten title to improve search appearance',
      });
      score -= 5;
    }

    // Audit description
    if (!listing.description) {
      issues.push({
        type: 'missing_description',
        severity: 'critical',
        message: 'Listing has no description',
        recommendation: 'Add a detailed description (120-160 characters)',
      });
      score -= 20;
    } else if (listing.description.length < 50) {
      issues.push({
        type: 'short_description',
        severity: 'warning',
        message: `Description is too short (${listing.description.length} chars)`,
        recommendation: 'Expand description to provide more details',
      });
      score -= 10;
    } else if (listing.description.length > 5000) {
      issues.push({
        type: 'long_description',
        severity: 'info',
        message: 'Description is very long',
        recommendation:
          'Consider shortening for better readability in search results',
      });
      score -= 2;
    }

    // Audit images
    if (!listing.images || listing.images.length === 0) {
      issues.push({
        type: 'missing_images',
        severity: 'critical',
        message: 'Listing has no images',
        recommendation: 'Add at least 1-3 high-quality images',
      });
      score -= 25;
    } else if (listing.images.length < 3) {
      issues.push({
        type: 'few_images',
        severity: 'warning',
        message: `Listing has only ${listing.images.length} image(s)`,
        recommendation: 'Add 3+ images to increase engagement',
      });
      score -= 8;
    }

    // Audit alt text
    const missingAltText = listing.images?.filter(
      (img: any) => !img.altText,
    ).length;
    if (missingAltText > 0) {
      issues.push({
        type: 'missing_alt_text',
        severity: 'warning',
        message: `${missingAltText} image(s) missing alt text`,
        recommendation: 'Add descriptive alt text to all images',
      });
      score -= 5;
    }

    // Audit category
    if (!listing.category) {
      issues.push({
        type: 'missing_category',
        severity: 'critical',
        message: 'Listing has no category',
        recommendation: 'Select an appropriate category',
      });
      score -= 15;
    }

    // Audit price
    if (!listing.price) {
      issues.push({
        type: 'missing_price',
        severity: 'warning',
        message: 'Listing has no price',
        recommendation: 'Set a price for better visibility in search',
      });
      score -= 10;
    }

    // Audit location
    if (!listing.emirate) {
      issues.push({
        type: 'missing_location',
        severity: 'warning',
        message: 'Listing has no location',
        recommendation: 'Specify the emirate/location',
      });
      score -= 10;
    }

    const recommendations: string[] = [];
    if (score < 50) {
      recommendations.push('Critical issues found. Please address them first.');
    }
    if (listing.images && listing.images.length > 0) {
      const avgQuality =
        listing.images.reduce((sum: number, img: any) => sum + (img.qualityScore || 50), 0) /
        listing.images.length;
      if (avgQuality < 60) {
        recommendations.push(
          'Image quality is low. Consider uploading higher-quality images.',
        );
      }
    }

    recommendations.push('Use specific, descriptive keywords in title and description');
    recommendations.push('Include dimensions, condition, and brand information if applicable');
    recommendations.push('Add contact information and response time expectations');

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
    };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  }

  getScoringTips(): Array<{ title: string; description: string }> {
    return [
      {
        title: 'Use Rich Keywords',
        description:
          'Include specific keywords (brand, model, condition) in title and description',
      },
      {
        title: 'Add Quality Images',
        description:
          'High-quality images increase CTR by up to 30% and attract more buyers',
      },
      {
        title: 'Complete Profile',
        description:
          'Fill all fields including description, price, location, and category',
      },
      {
        title: 'Regular Updates',
        description:
          'Update listings regularly to keep them fresh and visible in search',
      },
      {
        title: 'Mobile Friendly',
        description:
          '90% of users browse on mobile. Ensure images and text display well on small screens',
      },
    ];
  }
}
