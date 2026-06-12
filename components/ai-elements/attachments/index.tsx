import * as React from "react"
export const Attachment = ({ children, data, onRemove }: any) => <div className="flex items-center gap-2 p-1 border rounded">{children}</div>
export const AttachmentPreview = () => <div className="w-8 h-8 bg-muted rounded" />
export const AttachmentRemove = ({ onClick }: any) => <button onClick={onClick} className="text-xs">remove</button>
export const Attachments = ({ children, variant }: any) => <div className="flex gap-2">{children}</div>
