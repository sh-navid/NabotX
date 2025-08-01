import styled from "styled-components";
import React from "react";

import clear from "../assets/clear.png";
import send from "../assets/send.png";
import Checkbox from "./Checkbox";

export const InputWrapper = styled.div`
  position: fixed;
  bottom: 0.5rem;
  left: 50%;
  z-index: 1000;
  display: flex;
  align-items: center;
  max-width: 600px;
  background-color: var(--widget-background);
  border: 1px solid var(--widget-border);
  border-radius: 0.5rem;
  gap: 0.5rem;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px var(--shadow, rgba(0, 0, 0, 0.15));
  width: 97%;
  padding: 0.4rem 0.65rem;
`;

export const InputWrapperTextarea = styled.textarea`
  background-color: transparent;
  border: none;
  color: var(--input-foreground);
  font-size: 0.8rem;
  padding: 0.5rem .4rem;
  min-height: 6rem;
  max-height: 20rem;
  flex-grow: 1;
  outline: none;
  resize: vertical;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbarSlider-background) var(--input-background);
  margin-top: 2rem !important;

  &::-webkit-scrollbar {
    width: 0.625rem;
  }

  &::-webkit-scrollbar-track {
    background-color: var(--input-background);
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbarSlider-background);
    border-radius: 1rem;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--scrollbarSlider-hoverBackground);
  }
`;

export const InputButton = styled.img`
  background-color: transparent !important;
  color: var(--button-foreground);
  border: none !important;
  padding: 0.5rem;
  cursor: pointer;
  width: 2rem;

  position: absolute !important;
  top: 0.5rem;
  right: 0.5rem;

  &:hover {
    opacity: 0.5;
  }
`;

export const CleanButton = styled(InputButton)`
  width: 2.05rem;
  right: auto;
  left: 0.5rem;
`;

export const SendButton = styled(InputButton)``;

const InputArea = ({
  userInput,
  setUserInput,
  clearChat,
  handleUserInputKeyDown,
  handleSendButtonClick,
  model,
  agentMode,
  setAgentMode,
  hpMode,
  setHpMode,
}) => {
  const handleAgentModeChange = (e) => {
    setAgentMode(e.target.checked);
  };

  const handleHpModeChange = (e) => {
    setHpMode(e.target.checked);
  };
  return (
    <InputWrapper>
      <InputWrapperTextarea
        id="userInput"
        placeholder="Type your prompt or use /command"
        autoComplete="off"
        aria-label="Message input"
        autoFocus
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleUserInputKeyDown}
      />

      <CleanButton src={clear} onClick={clearChat} title="Clear Chat" />

      <SendButton
        src={send}
        id="sendButton"
        title={`Send Message to ${model}`}
        onClick={handleSendButtonClick}
      />
    </InputWrapper>
  );
};

export default InputArea;
