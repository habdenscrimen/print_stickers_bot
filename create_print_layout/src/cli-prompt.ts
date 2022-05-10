import inquirer from 'inquirer'

export enum CliCommands {
  CountUnprocessedImages = 'Count unprocessed images',
  CreateLayouts = 'Create layouts',
  DownloadProcessedLayouts = 'Download processed layouts',
  Exit = 'exit',
}

export const promptCommand = async () => {
  try {
    const answer: { action: CliCommands } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: 'Select an action',
        choices: [
          CliCommands.CountUnprocessedImages,
          CliCommands.CreateLayouts,
          CliCommands.DownloadProcessedLayouts,
          CliCommands.Exit,
        ],
      },
    ])

    return answer.action
  } catch (error) {
    console.error(error)
    return CliCommands.Exit
  }
}
