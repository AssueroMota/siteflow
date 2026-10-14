import { Check, CirclePause } from 'lucide-react';
import { projectJourney } from '../../data/projectJourney';

export default function ProjectProgress({ status }) {
  const current = projectJourney.findIndex(([key]) => key === status);
  if (status === 'Cancelado')
    return (
      <div className="project-stage cancelled">
        <CirclePause size={21} />
        <div>
          <h3>Solicitação cancelada</h3>
          <p>
            Esta solicitação foi encerrada. Entre em contato para conversar sobre um novo projeto.
          </p>
        </div>
      </div>
    );
  if (current < 0) return null;
  return (
    <>
      <div className="project-stage">
        <span>{String(current + 1).padStart(2, '0')}</span>
        <div>
          <h3>{projectJourney[current][1]}</h3>
          <p>{projectJourney[current][2]}</p>
        </div>
      </div>
      <ol className="project-progress" aria-label="Etapas do projeto">
        {projectJourney.map(([key, title], index) => (
          <li
            key={key}
            className={index < current ? 'complete' : index === current ? 'current' : ''}
            aria-current={index === current ? 'step' : undefined}
          >
            <span>{index < current ? <Check size={14} /> : index + 1}</span>
            <div>
              <b>{title}</b>
              <small>{key}</small>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
