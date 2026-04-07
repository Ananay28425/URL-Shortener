export default function GradientButton({
  children,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-md border border-[#333333] bg-[#F38020] px-4 py-2 text-xs font-bold uppercase tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
