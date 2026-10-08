const options = entries => entries.map(([value, label]) => ({ value, label, enabled: true }));
module.exports = {
  courseLevel: { title: 'Course levels', addable: true, options: options([['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']]) },
  difficulty: { title: 'Problem difficulties', addable: true, options: options([['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']]) },
  topics: { title: 'Document and AI topics', addable: true, options: options([['general', 'General'], ['math', 'Mathematics'], ['science', 'Science'], ['history', 'History'], ['programming', 'Programming']]) },
  contactSubject: { title: 'Contact subjects', addable: true, options: options([['general', 'General Inquiry'], ['courses', 'Course Information'], ['enterprise', 'Enterprise Partnership'], ['support', 'Technical Support'], ['feedback', 'Feedback']]) },
  lessonType: { title: 'Lesson types', addable: false, options: options([['video', 'Video'], ['text', 'Text / Article'], ['quiz', 'Quiz'], ['coding', 'Coding challenge']]) },
  roles: { title: 'User roles', addable: false, options: options([['1', 'Admin'], ['2', 'Mentor'], ['3', 'Student']]) },
  courseStatus: { title: 'Course publication states', addable: false, options: options([['draft', 'Draft'], ['published', 'Published'], ['archived', 'Archived']]) },
  language: { title: 'Coding language', addable: false, options: options([['java', 'Java']]) },
};
