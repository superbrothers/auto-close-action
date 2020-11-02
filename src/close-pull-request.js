import * as core from "@actions/core";
import * as github from "@actions/github";
import * as errors from "./errors";

export const run = async () => {
  const context = github.context;
  if (context.eventName !== "pull_request_target") {
    throw errors.ignoreEvent;
  }

  const token = process.env["GITHUB_TOKEN"] || "";
  if (token === "") {
    throw errors.noToken;
  }

  const client = new github.GitHub(token);

  // *Optional*. Post an issue comment just before closing a pull request.
  const body = core.getInput("comment");
  if (body.length > 0) {
    core.info("Creating a comment");
    await client.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body
    });
  }

  core.info("Updating the state of a pull request to closed");
  await client.pulls.update({
    ...context.repo,
    pull_number: context.issue.number,
    state: "closed"
  });

  core.info(`Closed a pull request ${context.issue.number}`);
};
