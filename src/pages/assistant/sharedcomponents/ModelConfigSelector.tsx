import { useState } from 'react';

import { ModelTag, ReasoningEffort } from '../../../services/models';
import { ModelConfig, useAppStore } from '../../../store';

const getDefaultReasoningEffort = (model: ModelTag): ReasoningEffort => {
  if ([ModelTag.GPT_OSS, ModelTag.GEMINI_PRO].includes(model))
    return ReasoningEffort.LOW;
  return ReasoningEffort.NONE;
};

const shouldHideReasoningEffort = (model: ModelTag): boolean => {
  return [ModelTag.OPUS, ModelTag.FABLE, ModelTag.GROK].includes(model);
};

const MODEL_LABELS: Record<ModelTag, string> = {
  [ModelTag.GEMINI_PRO]: 'Gemini Pro',
  [ModelTag.GPT_OSS]: 'GPT OSS',
  [ModelTag.GROK]: 'Grok',
  [ModelTag.OPUS]: 'Opus',
  [ModelTag.FABLE]: 'Fable',
  [ModelTag.GLM]: 'GLM',
  [ModelTag.GPT]: 'GPT',
  [ModelTag.GPT_LUNA]: 'GPT Luna',
};

export default function ModelConfigSelector({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { modelConfig, setModelConfig, setDefaultModelConfig } = useAppStore();
  const [hideReasoningEffort, setHideReasoningEffort] = useState(
    shouldHideReasoningEffort(modelConfig.modelInstance),
  );

  const setConfig = (config: ModelConfig) => {
    setModelConfig(config);
    setDefaultModelConfig(config);
  };

  const handleModelChange = (model: ModelTag) => {
    setConfig({
      modelInstance: model,
      reasoningEffort: getDefaultReasoningEffort(model),
    });
    setHideReasoningEffort(shouldHideReasoningEffort(model));
  };

  const handleReasoningEffortChange = (effort: ReasoningEffort) => {
    setConfig({
      ...modelConfig,
      reasoningEffort: effort,
    });
  };

  return (
    <div className={'flex gap-2'}>
      <select
        tabIndex={1}
        value={modelConfig.modelInstance}
        onChange={e => handleModelChange(e.target.value as ModelTag)}
        disabled={disabled}
        className="px-3 py-1 disabled:opacity-50"
      >
        <option value={ModelTag.FABLE}>{MODEL_LABELS[ModelTag.FABLE]}</option>
        <option value={ModelTag.GPT}>{MODEL_LABELS[ModelTag.GPT]}</option>
        <option value={ModelTag.GROK}>{MODEL_LABELS[ModelTag.GROK]}</option>
        <option value={ModelTag.OPUS}>{MODEL_LABELS[ModelTag.OPUS]}</option>
        <option value={ModelTag.GPT_LUNA}>
          {MODEL_LABELS[ModelTag.GPT_LUNA]}
        </option>
        <option value={ModelTag.GLM}>{MODEL_LABELS[ModelTag.GLM]}</option>
        <option value={ModelTag.GEMINI_PRO}>
          {MODEL_LABELS[ModelTag.GEMINI_PRO]}
        </option>
        <option value={ModelTag.GPT_OSS}>
          {MODEL_LABELS[ModelTag.GPT_OSS]}
        </option>
      </select>
      {!hideReasoningEffort && (
        <select
          tabIndex={1}
          value={modelConfig.reasoningEffort}
          onChange={e =>
            handleReasoningEffortChange(e.target.value as ReasoningEffort)
          }
          disabled={disabled}
          className="px-3 py-1 disabled:opacity-50"
        >
          <option value={ReasoningEffort.NONE}>None</option>
          <option value={ReasoningEffort.LOW}>Low</option>
          <option value={ReasoningEffort.HIGH}>High</option>
        </select>
      )}
    </div>
  );
}
