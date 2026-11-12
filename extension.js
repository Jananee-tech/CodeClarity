// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	const Groq = (await import("groq-sdk")).default;

    let apiKey = await context.secrets.get("groqApiKey");

	const configureKey = vscode.commands.registerCommand(
    'codeclarity.configureApiKey',
		async () => {
			const key = await vscode.window.showInputBox({
				prompt: 'Enter your Groq API key',
				password: true,
				ignoreFocusOut: true
			});

			if (!key) {
				return;
			}

			await context.secrets.store('groqApiKey', key.trim());
			apiKey = key.trim();

			vscode.window.showInformationMessage(
				'CodeClarity: Groq API key saved securely!'
			);
		}
	);

	context.subscriptions.push(configureKey);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codeclarity" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codeclarity.explainCode', function () {

    // Get the active editor FIRST
		const editor =
			vscode.window.activeTextEditor ||
			vscode.window.visibleTextEditors[0];

		console.log('Active editor:', editor);

		if (!editor) {
			vscode.window.showErrorMessage(
				'CodeClarity: No active editor found! Please open a code file.'
			);
			return;
		}

		// Get selected code
		const selectedCode = editor.document.getText(editor.selection);

		if (!selectedCode.trim()) {
			vscode.window.showWarningMessage(
				'Please select some code first!'
			);
			return;
		}

    vscode.window.showInformationMessage(
        'CodeClarity command is running!'
    );

    // Keep the rest of your existing code here,
    // starting from createWebviewPanel(...)
			const panel = vscode.window.createWebviewPanel(
				'codeclarity',
				'CodeClarity',
				vscode.ViewColumn.Beside,
				{
					enableScripts: true
				}
			);

			const safeSelectedCode = JSON.stringify(selectedCode)
    			.replace(/</g, '\\u003c');

			panel.webview.html = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>CodeClarity</title>

				<style>
					body {
						font-family: var(--vscode-font-family);
						background: var(--vscode-editor-background);
						color: var(--vscode-editor-foreground);
						padding: 20px;
					}

					h1 {
						font-size: 24px;
					}

					.section {
						margin-top: 25px;
					}

					.code-box {
						background: var(--vscode-textCodeBlock-background);
						border: 1px solid var(--vscode-panel-border);
						padding: 15px;
						border-radius: 8px;
						overflow-x: auto;
					}

					pre {
						white-space: pre-wrap;
						word-break: break-word;
					}

					.explanation {
						padding: 15px;
						border: 1px solid var(--vscode-panel-border);
						border-radius: 8px;
						line-height: 1.6;
					}

					button {
						margin-top: 15px;
						padding: 9px 16px;
						background: var(--vscode-button-background);
						color: var(--vscode-button-foreground);
						border: none;
						border-radius: 5px;
						cursor: pointer;
					}

					button:hover {
						background: var(--vscode-button-hoverBackground);
					}
				</style>
			</head>

			<body>

				<h1>CodeClarity</h1>
				<p>Your AI code explanation assistant.</p>

				<div class="section">
					<h2>Selected Code</h2>
					<div class="code-box">
						<pre id="selected-code"></pre>
					</div>
				</div>

				<div class="section">
				<h2>Explanation</h2>
				<div class="explanation" id="explanation">
					Generating explanation...
				</div>
			</div>
				<script>
					const vscode = acquireVsCodeApi();

					const selectedCode = ${safeSelectedCode};

					document.getElementById('selected-code').textContent = selectedCode;

					window.addEventListener('message', event => {
						const message = event.data;

						if (message.command === 'showExplanation') {
							document.getElementById('explanation').textContent =
								message.text;
						}
					});
					vscode.postMessage({
						command: 'explain'
					});
				</script>

			</body>
			</html>
			`;
			panel.webview.onDidReceiveMessage(async message => {
				if (message.command === 'explain') {

					try {
						if (!apiKey) {
							vscode.window.showErrorMessage(
								'CodeClarity: Groq API key is missing. Please configure your API key.'
							);
							return;
						}

						const ai = new Groq({
							apiKey: apiKey
						});
						panel.webview.postMessage({
							command: 'showExplanation',
							text: 'CodeClarity is analyzing your code...'
						});

						console.log('CodeClarity: Sending request to Groq...');

						const response = await ai.chat.completions.create({
							model: "openai/gpt-oss-20b",
							messages: [
								{
									role: "user",
									content: `You are CodeClarity, an intelligent and friendly programming tutor.
					

						Your job is to help users genuinely understand the code they provide.

						Analyze the code and generate ONE clear, accurate and useful explanation.

						Follow these guidelines:

						1. WHAT THE CODE DOES
						- Start with a short explanation of the program's purpose.
						- Explain what problem it solves.

						2. HOW THE CODE WORKS
						- Explain the important lines in their execution order.
						- Use numbered steps.
						- Explain why important operations are performed, not just what they do.
						- Avoid repeating the same information.

						3. EXAMPLE WALKTHROUGH
						- Include a small example or variable trace when it helps understanding.
						- For loops, explain important iterations.
						- For algorithms, explain how the logic progresses.
						- Use a table when it makes the explanation easier to understand.

						4. OUTPUT
						- Show the expected output when applicable.
						- Explain briefly how the output is obtained.

						5. IMPORTANT CONCEPTS
						- Explain only the programming concepts actually used.
						- Define unfamiliar terms in beginner-friendly language.

						ADAPTIVE EXPLANATION RULES:
						- Very simple code: approximately 3-4 meaningful lines of explanation.
						- Small programs: concise summary and important line explanations.
						- Medium programs: explain the logic in clear steps with examples where useful.
						- Complex programs and algorithms: provide a deeper walkthrough, variable traces and important edge cases where relevant.
						- Never force unnecessary sections into an explanation.
						- Never make an explanation longer just to appear detailed.

						WRITING RULES:

						- Write in natural, simple sentences.
						- Use short, readable paragraphs.
						- Do not use Markdown headings, numbered lists, tables or decorative symbols.
						- Do not include unnecessary line breaks.
						- Keep simple code explanations to 3-4 meaningful sentences.
						- Explain complex code in more depth when necessary.
						- Avoid repeating information.
						- Never invent program output.
						The goal is not to describe every line mechanically.
						The goal is to make the user understand the code.

						Code to explain:
						${selectedCode}`
								}
							]
						});

						console.log('CodeClarity: Groq response received!');

						panel.webview.postMessage({
							command: 'showExplanation',
							text: response.choices[0]?.message?.content || 'Groq returned an empty response.'
						});

					} catch (error) {
						console.error('Groq API Error:', error);

						console.error('CodeClarity: Groq request failed:', error);
						
						panel.webview.postMessage({
							command: 'showExplanation',
							text: 'Unable to generate explanation. Error: ' +
    							(error instanceof Error ? error.message : String(error))
						});
					}
				}
			});
		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
