export default {
  state: {
    selectedProject: null,
    projects: []
  },
  namespaced: true,
  mutations: {
    setProjects (state, projects) {
      state.projects = projects
    },
    setSelectedProject (state, project) {
      state.selectedProject = project
    },
    toggleTaskCompleted (state, task) {
      task.completed = !task.completed
    },
    updateTaskDescription (state, message) {
      message.task.description = message.description
    },
    deleteTask (state, task) {
      state.selectedProject.tasks.splice(state.selectedProject.tasks.indexOf(task), 1)
    },
    createTask (state) {
      state.selectedProject.tasks.push({
        description: '',
        completed: false
      })
    },
    createProject (state, title) {
      state.projects.push({
        title: title,
        tasks: []
      })
      state.selectedProject = state.projects[state.projects.length - 1]
    },
    deleteProject (state) {
      state.projects.splice(state.projects.indexOf(state.selectedProject), 1)
      state.selectedProject = null
      if (state.projects.length) {
        state.selectedProject = state.projects[0]
      }
    },
    updateProjectTitle (state, title) {
      state.selectedProject.title = title
    },
    setProjectTasks (state, tasks) {
      state.selectedProject.tasks = tasks
    }
  }
}
