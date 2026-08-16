import type { CollectionAfterChangeHook } from 'payload'

// Fires on new form-submissions. Only sends an email when the related Form has
// "Send internal notification email" checked (see formOverrides in src/plugins/index.ts) —
// this collection is shared by every form-builder form, not just the contact form.
export const sendContactNotificationEmail: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (operation !== 'create') return doc

  const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL
  if (!notificationEmail) return doc

  try {
    const formID = typeof doc.form === 'object' ? doc.form?.id : doc.form
    if (!formID) return doc

    const form = await req.payload.findByID({
      collection: 'forms',
      id: formID,
      depth: 0,
    })

    if (!form?.sendAdminNotification) return doc

    const submissionData: { field: string; value: unknown }[] = doc.submissionData || []
    const summary = submissionData.map(({ field, value }) => `${field}: ${value}`).join('\n')

    await req.payload.sendEmail({
      to: notificationEmail,
      subject: `New submission: ${form.title}`,
      text: `A new submission was received for "${form.title}".\n\n${summary}`,
    })
  } catch (err) {
    // Never block the submission from saving because notification email failed.
    req.payload.logger.error({ err }, 'Failed to send contact notification email')
  }

  return doc
}
