export const ReviewReportReason = {
  VULGAR: 'VULGAR',
  ADULT_CONTENT: 'ADULT_CONTENT',
  SPAM: 'SPAM',
  PERSONAL_INFO: 'PERSONAL_INFO',
  ILLEGAL_ADVERTISING: 'ILLEGAL_ADVERTISING',
  FALSE_INFORMATION: 'FALSE_INFORMATION',
  OTHER: 'OTHER',
} as const
export type ReviewReportReason = (typeof ReviewReportReason)[keyof typeof ReviewReportReason]

export const ReviewReportStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const
export type ReviewReportStatus = (typeof ReviewReportStatus)[keyof typeof ReviewReportStatus]
