export function BuddyMark({ size = 36 }: { size?: number }) {
  return (
    <span className="cd-buddy" style={{ width: size, height: size }} aria-hidden="true">
      <span>
        <i className="cd-orb-eye" />
        <i className="cd-orb-eye" />
      </span>
    </span>
  )
}
