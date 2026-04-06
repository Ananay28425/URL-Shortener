import GradientButton from './GradientButton'

export default function EmptyState({ title = 'No links yet', description = 'Create your first short URL to see analytics.', actionText = 'Create URL', onAction }) {
  return (
    <div className="glass-card p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-brand-muted">{description}</p>
      {onAction && <GradientButton className="mt-5" onClick={onAction}>{actionText}</GradientButton>}
    </div>
  )
}
