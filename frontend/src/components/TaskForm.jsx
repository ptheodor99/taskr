import { CalendarDays, FileText, Flag, Save, Tag, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EMPTY_TASK, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/taskConstants.js';

function formValuesFromTask(task) {
  if (!task) {
    return EMPTY_TASK;
  }

  return {
    title: task.title ?? '',
    description: task.description ?? '',
    status: task.status ?? 'Inbox',
    priority: task.priority ?? 'Medium',
    dueDate: task.dueDate ?? ''
  };
}

function validate(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required';
  }

  if (values.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or fewer';
  }

  if (values.description.trim().length > 1000) {
    errors.description = 'Description must be 1000 characters or fewer';
  }

  return errors;
}

export function TaskForm({ task, isSubmitting, onCancel, onSubmit }) {
  const [values, setValues] = useState(formValuesFromTask(task));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setValues(formValuesFromTask(task));
    setErrors({});
    setSubmitError('');
  }, [task]);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate || null
      });
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{task ? 'Edit task' : 'New task'}</p>
          <h2>{task ? 'Refine the details' : 'Capture work quickly'}</h2>
        </div>
        <button className="icon-button" type="button" aria-label="Close task form" onClick={onCancel}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {submitError ? <div className="form-error">{submitError}</div> : null}

      <label className="field">
        <span>
          <Type size={15} aria-hidden="true" />
          Title
        </span>
        <input
          value={values.title}
          maxLength={140}
          onChange={(event) => updateValue('title', event.target.value)}
          placeholder="Write a clear next action"
          aria-invalid={errors.title ? 'true' : 'false'}
        />
        {errors.title ? <small>{errors.title}</small> : null}
      </label>

      <label className="field">
        <span>
          <FileText size={15} aria-hidden="true" />
          Description
        </span>
        <textarea
          value={values.description}
          rows={5}
          onChange={(event) => updateValue('description', event.target.value)}
          placeholder="Optional context, links, or notes"
          aria-invalid={errors.description ? 'true' : 'false'}
        />
        {errors.description ? <small>{errors.description}</small> : null}
      </label>

      <div className="form-grid">
        <label className="field">
          <span>
            <Tag size={15} aria-hidden="true" />
            Status
          </span>
          <select value={values.status} onChange={(event) => updateValue('status', event.target.value)}>
            {STATUS_OPTIONS.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>
            <Flag size={15} aria-hidden="true" />
            Priority
          </span>
          <select value={values.priority} onChange={(event) => updateValue('priority', event.target.value)}>
            {PRIORITY_OPTIONS.map((priority) => (
              <option value={priority} key={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          Due date
        </span>
        <input type="date" value={values.dueDate} onChange={(event) => updateValue('dueDate', event.target.value)} />
      </label>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-action" type="submit" disabled={isSubmitting}>
          <Save size={17} aria-hidden="true" />
          {isSubmitting ? 'Saving' : task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
