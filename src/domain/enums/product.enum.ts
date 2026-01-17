export const ApproveProductStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const
export type ApproveProductStatus = (typeof ApproveProductStatus)[keyof typeof ApproveProductStatus]