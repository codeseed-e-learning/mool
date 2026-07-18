import type { Request } from "@codeseedelearning/mool-http";
import { validate } from "@codeseedelearning/mool-validation";
import { ModelNotFoundError } from "@codeseedelearning/mool-orm";

import { Project } from "../Models/Project.js";

export class ProjectController {
  static async index() {
    const projects = await Project.orderBy("created_at", "desc").get();

    return { projects };
  }

  static async show(request: Request) {
    try {
      const project = await Project.findOrFail(request.params.id);

      return { project };
    } catch (error) {
      if (error instanceof ModelNotFoundError) {
        return { success: false, message: error.message };
      }

      throw error;
    }
  }

  static async store(request: Request) {
    const { valid, errors } = validate(request.body, {
      title: "required|string|min:2",
      description: "required|string|min:2",
      tech_stack: "required|string|min:2",
    });

    if (!valid) {
      return { success: false, errors };
    }

    const project = await Project.create({
      title: request.body.title,
      description: request.body.description,
      tech_stack: request.body.tech_stack,
      repo_url: request.body.repo_url ?? null,
      created_at: new Date().toISOString(),
    });

    return { success: true, project };
  }
}
