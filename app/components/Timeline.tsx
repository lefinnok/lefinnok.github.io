import type { Role } from "~/lib/content";

export function Timeline({ roles }: { roles: Role[] }) {
  return (
    <div className="timeline">
      {roles.map((role) => (
        <div className="tl" key={`${role.period}-${role.org}`}>
          <div className="tl__year">{role.period}</div>
          <strong>{role.org}</strong>
          <span>{role.title}</span>
          <span>{role.summary}</span>
        </div>
      ))}
    </div>
  );
}
