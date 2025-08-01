let msgArray = [
  {
    role: "assistant",
    content: "${rules}",
  },
];

let commandPanelVisible = false;
let filteredCommands = [];

const commands = [
  { name: "/tree", description: "Build project structure" },
  { name: "/commit", description: "Generate commit message" },
  {
    name: "/break",
    description: "Think to break project into smaller more clear structure",
  },
];

function showCommandPanel(filter = "") {
  filteredCommands = commands.filter((command) =>
    command.name.startsWith(filter)
  );

  if (!commandPanelVisible) {
    const commandPanel = $("<div>")
      .attr("id", "commandPanel")
      .addClass("command-panel")
      .css({
        position: "absolute",
        top: "auto",
        bottom: "6rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      });

    updateCommandPanel(commandPanel);

    $("body").append(commandPanel);
    commandPanelVisible = true;
  } else {
    const commandPanel = $("#commandPanel");
    updateCommandPanel(commandPanel);
  }
}

function updateCommandPanel(commandPanel) {
  commandPanel.empty();

  filteredCommands.forEach((command) => {
    const commandButton = $("<button>")
      .text(command.name + " - " + command.description)
      .addClass("command-button")
      .click(() => {
        $("#userInput").val(command.name);
        hideCommandPanel();
        $("#sendButton").click();
      });
    commandPanel.append(commandButton);
  });

  if (filteredCommands.length === 0) {
    commandPanel.append(
      $("<div>").text("No matching commands").css({
        padding: "5px",
        "text-align": "center",
        color: "var(--vscode-disabledForeground)",
      })
    );
  }
}

function hideCommandPanel() {
  if (commandPanelVisible) {
    $("#commandPanel").remove();
    commandPanelVisible = false;
  }
}

function clearChat() {
  msgArray = [
    {
      role: "system",
      content: `Rules: ${rules}`,
    },
  ];
  $("#chatMessages").html("");
  $("#logoHolder").show();
}

function highlightCode(codeElement, code) {
  Prism.highlightElement(codeElement[0]);
}

function addMessage(file, text, fromUser = true, type = null) {
  $("#logoHolder").hide();
  let msgDiv = $("<div>")
    .addClass("msg-container")
    .addClass("message")
    .addClass(fromUser ? "user" : "bot");

  if ((file + "").trim() !== "") {
    msgDiv.append(`<div class='code-block-file-name'>${file}</div>`);
  }

  if (type && type === "structure") {
    msgDiv = $("<pre>")
      .addClass("msg-container")
      .addClass("message")
      .addClass(fromUser ? "user" : "bot");
  }

  if (text.length > 100 && fromUser) {
    const shortText = text.substring(0, 100);
    const remainingText = text.substring(100);

    const shortSpan = $("<span>").addClass("short-text").text(shortText);
    const expandButton = $("<button>").text("Expand").addClass("more-button");
    const collapseButton = $("<button>")
      .text("Collapse")
      .addClass("more-button")
      .hide();
    const fullSpan = $("<span>")
      .addClass("remaining-text")
      .text(remainingText)
      .hide();

    expandButton.click(() => {
      fullSpan.slideDown("fast");
      expandButton.hide();
      collapseButton.show();
    });

    collapseButton.click(() => {
      fullSpan.slideUp("fast");
      expandButton.show();
      collapseButton.hide();
    });

    msgDiv.append(shortSpan, expandButton, fullSpan, collapseButton);
  } else {
    msgDiv.text(text);
  }

  $("#chatMessages")
    .append(msgDiv)
    .scrollTop($("#chatMessages")[0].scrollHeight);
}

let originalCodeBlocks = {};

function addBotMessage(response) {
  const msgDiv = $("<div>").addClass("message bot");
  if (response?.choices?.[0]?.message?.content) {
    let content = response.choices[0].message.content;

    const markedContent = marked.parse(content);

    msgDiv.html(markedContent);
    $("#chatMessages")
      .append(msgDiv)
      .scrollTop($("#chatMessages")[0].scrollHeight);

    msgDiv.find("pre code").each(function () {
      const codeElement = $(this);
      const code = codeElement.text();
      // Identify if the code block is a terminal script, e.g., has #[[Terminal]] on the first line
      const isTerminalCode = code.trim().startsWith("#[[Terminal]]");

      highlightCode(codeElement, code);

      codeElement.parent().css("position", "relative").append(`
        <div class="code-btns-container">
          <img src="${btnOpenCodeFile}" alt="Open Code File"  />
          <img class="replace-btn" src="${btnReplace}" alt="Replace File" />
          <img class="copy-btn" src="${btnCopy}" alt="Copy File"  />
          <img class="diff-btn" src="${btnDiff}" alt="Diff File" style="display: none;" />
          <img class="undo-btn" src="${btnUndo}" alt="Undo File" style="display: none;" />
        </div>
      `);

      const preElement = codeElement.parent();
      preElement.css({
        position: "relative",
        "max-height": "100px",
        overflow: "hidden",
      });

      const moreButton = $("<button>").text("More...").addClass("more-button");
      const lessButton = $("<button>")
        .text("Less...")
        .addClass("more-button")
        .hide();

      const buttonContainer = $("<div>")
        .addClass("code-buttons-container")
        .css({
          "text-align": "center",
          "margin-top": "5px",
          "margin-bottom": "0px",
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          "z-index": 1,
        })
        .append(moreButton)
        .append(lessButton);

      preElement.append(buttonContainer);

      function setButtonPosition(isExpanded) {
        buttonContainer.css({
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          "z-index": 1,
        });
      }

      moreButton.click(() => {
        preElement.animate(
          { "max-height": preElement[0].scrollHeight },
          "fast"
        );
        moreButton.hide();
        lessButton.show();
        setButtonPosition(true);
      });

      lessButton.click(() => {
        preElement.animate({ "max-height": "100px" }, "fast");
        lessButton.hide();
        moreButton.show();
        setButtonPosition(false);
      });

      const replaceBtn = codeElement
        .parent()
        .find(".code-btns-container .replace-btn");
      const diffBtn = codeElement
        .parent()
        .find(".code-btns-container .diff-btn");
      const undoBtn = codeElement
        .parent()
        .find(".code-btns-container .undo-btn");

      codeElement
        .parent()
        .find(".code-btns-container img:eq(0)")
        .click(() => {
          vscode.postMessage({ command: "openCodeFile", code });
        });

      replaceBtn.click(() => {
        // Use copyToTerminal command when the code block is a terminal script
        const replaceCommand = isTerminalCode
          ? "copyToTerminal"
          : "replaceActiveFile";
        vscode.postMessage({ command: replaceCommand, code });
        if(!isTerminalCode){

          replaceBtn.hide();
          diffBtn.show();
          undoBtn.show();
        }
      });

      codeElement
        .parent()
        .find(".code-btns-container img:eq(2)")
        .click(() => {
          vscode.postMessage({ command: "copyCodeBlock", code });
        });

      diffBtn.click(() => {
        vscode.postMessage({ command: "diffCodeBlock", code });
      });

      undoBtn.click(() => {
        vscode.postMessage({ command: "undoCodeBlock", code });
        replaceBtn.show();
        diffBtn.hide();
        undoBtn.hide();
      });
    });

    if (msgDiv.find("pre code").length > 0) {
      const acceptButton = $("<button>")
        .text("ACCEPT ALL")
        .addClass("accept-button");

      const rejectButton = $("<button>")
        .text("ROLLBACK ALL")
        .addClass("reject-button")
        .hide();

      const buttonsContainer = $("<div>")
        .addClass("code-decision-buttons")
        .append(acceptButton)
        .append(rejectButton);

      msgDiv.append(buttonsContainer);

      msgDiv.find("pre code").each(function (index) {
        const codeElement = $(this);
        originalCodeBlocks[index] = codeElement.text();
      });

      acceptButton.click(function () {
        const codeBlocks = msgDiv.find("pre code");
        let delay = 0;

        codeBlocks.each(function () {
          const codeElement = $(this);
          const code = codeElement.text();
          // Use copyToTerminal command when the code block is a terminal script
          const isTerminalCode = code.trim().startsWith("#[[Terminal]]");
          const replaceCommand = isTerminalCode
            ? "copyToTerminal"
            : "replaceActiveFile";

          setTimeout(() => {
            vscode.postMessage({ command: "openCodeFile", code });

            setTimeout(() => {
              vscode.postMessage({ command: replaceCommand, code });
            }, 1000);
          }, delay);
          delay += 2000;
        });
        acceptButton.hide();
        rejectButton.show();
      });

      rejectButton.click(function () {
        vscode.postMessage({ command: "callGitDiscard" });
        acceptButton.show();
        rejectButton.hide();
      });
    }

    msgArray.push({ role: "assistant", content: markedContent });
  } else {
    msgDiv.text("No response from bot.");
    $("#chatMessages")
      .append(msgDiv)
      .scrollTop($("#chatMessages")[0].scrollHeight);
  }
}

async function sendToLLM(message) {
  msgArray.push({ role: "user", content: message });

  try {
    const response = await fetch(`${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: `${model}`,
        messages: msgArray,
      }),
    });
    if (!response.ok)
      throw new Error(`${response.status} - ${await response.text()}`);
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return {
      choices: [
        {
          message: {
            content:
              "Error communicating with AI: " +
              error.message +
              ` <a href="#" onclick="proceedToSend('','Retry...','Please review chats and respond again')">Retry...</a>`,
          },
        },
      ],
    };
  }
}

window.addEventListener("message", (event) => {
  const message = event.data;

  switch (message.command) {
    case "addTextToChat":
      msgArray.push({ role: "user", content: message.text });
      addMessage(message.path, message.raw, true);
      break;
    case "receiveProjectStructure":
      const structure = message.structure;
      msgArray.push({ role: "user", content: structure });
      proceedToSend(message.path, structure, structure, false, "structure");
      break;
    case "receiveProjectPreferences":
      const preferences = message.preferences;
      msgArray.push({ role: "user", content: preferences });
      proceedToSend(
        message.path,
        preferences,
        preferences,
        false,
        "preferences"
      );
      break;
  }
});

async function proceedToSend(
  file,
  userText,
  combinedMessage,
  send = true,
  type = null
) {
  addMessage(file, userText, true, type);
  $("#logoHolder").hide();
  $("#userInput").val("");
  $("#sendButton").prop("disabled", true);
  if (send) {
    const response = await sendToLLM(combinedMessage);

    addBotMessage(response);
  }
  $("#sendButton").prop("disabled", false).focus();
}

document.addEventListener("DOMContentLoaded", function () {
  clearChat();

  $("#userInput").on("keydown", (e) => {
    if (e.key === "Enter") {
      $("#sendButton").click();
      e.preventDefault();
      hideCommandPanel();
    } else if (e.key === "Escape") {
      hideCommandPanel();
    } else if (e.key === "/") {
      if ($("#userInput").val() === "") {
        showCommandPanel("/");
      } else {
        hideCommandPanel();
      }
    } else {
      if ($("#userInput").val().startsWith("/")) {
        const filterText = $("#userInput").val() + e.key;
        showCommandPanel(filterText);
      } else {
        hideCommandPanel();
      }
    }
  });

  $("#sendButton").click(() => {
    let text = $("#userInput").val().trim();
    if (!text) return;

    let prompt = "";

    switch (text) {
      case "/tree":
        vscode.postMessage({ command: "buildProjectStructure" });
        return;
      case "/commit":
        text = `Generating commit message...`;
        prompt = `Do not output any code or description; just make a commit message`;
        proceedToSend("", text, prompt, true);
        return;
      case "/break":
        vscode.postMessage({ command: "buildProjectStructure" });
        setTimeout(() => {
          vscode.postMessage({ command: "buildPreferencesStructure" });
        }, 1000);
        setTimeout(() => {
          text = `Thinking about project structure...`;
          prompt = `Do not output any code; Think about how to make project structure more clean by moving files, methods etc to repositories, services, helpers, components, views. models and such.`;
          proceedToSend("", text, prompt, true);
        }, 2000);
        return;
    }

    proceedToSend("", text, text, true);
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      hideCommandPanel();
    }
  });
});
