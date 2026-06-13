import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, actionLabel, actionTo }) => (
  <div className="empty empty--rich">
    <h3>{title}</h3>
    {description ? <p>{description}</p> : null}
    {actionLabel && actionTo ? (
      <Link to={actionTo} className="download-button">
        {actionLabel}
      </Link>
    ) : null}
  </div>
);

export default EmptyState;
