/*
 * PRISM AI - Persona Selector Component
 * Allows user to select reviewer persona which affects analysis style
 */

import React, { useState } from 'react';

const personas = [
  { id: 'startup-cto', name: 'Startup CTO', description: 'Practical and product-focused' },
  { id: 'security-expert', name: 'Security Expert', description: 'Strict and security-focused' },
  { id: 'performance-engineer', name: 'Performance Engineer', description: 'Technical and optimization-focused' },
  { id: 'faang-reviewer', name: 'FAANG Reviewer', description: 'High-standard and deeply analytical' }
];

export function PersonaSelector() {
  const [selectedPersona, setSelectedPersona] = useState('startup-cto');

  return (
    <div className="persona-selector">
      <h3>Reviewer Persona</h3>
      {personas.map(persona => (
        <div
          key={persona.id}
          className={`persona-option ${selectedPersona === persona.id ? 'selected' : ''}`}
          onClick={() => setSelectedPersona(persona.id)}
        >
          <div className="persona-icon">{getPersonaIcon(persona.id)}</div>
          <div className="persona-info">
            <h4>{persona.name}</h4>
            <p>{persona.description}</p>
          </div>
        </div>
      ))}
      <p className="selected-label">Selected: {personas.find(p => p.id === selectedPersona)?.name}</p>
    </div>
  );
}

function getPersonaIcon(personaId: string) {
  switch (personaId) {
    case 'startup-cto': return '🚀';
    case 'security-expert': return '🔒';
    case 'performance-engineer': return '⚡';
    case 'faang-reviewer': return '🏢';
    default: return '👤';
  }
}