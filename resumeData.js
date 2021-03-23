class Point {
  constructor(content,icon=null) {
    this.content = content;
    this.icon = icon;
  }
}

class Section {
  constructor(props) {
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.summary = props.summary;
    this.points = props.points || [];
    this.sections = props.sections || [];
  }
}

defaultNewPoint = new Point("Qui incididunt consectetur in labore aliqua sint.");

defaultNewSection = new Section({
  title: "Section Title",
  subtitle: "Section Subtitle",
  summary: "This is a seciton summary. Laboris dolor dolore excepteur culpa. Minim nostrud ipsum consectetur nulla et dolor eiusmod ad anim duis nisi laboris. Veniam voluptate officia consectetur sint id id culpa magna.",
  points: [{...defaultNewPoint}]
})
defaultNewSection.sections = [{...defaultNewSection}]


class ContactOption extends Point {
  constructor(type, value) { super(value, type) }
}

const contactOptions = new Section({
  title: "Contact Me",
  points: [
    new ContactOption("email", "contact@arthurjudd.com"),
    new ContactOption("website", "www.arthurjudd.com"),
    new ContactOption("linkedin", "@ajudd311"),
    new ContactOption("github", "@amj311"),
  ]
});


class Award extends Point {
  constructor(props) {
    super("","award");
    this.title = props.title;
    this.from = props.from;
    this.when = props.when;
    this.content = `${this.title}, ${this.from}, (${this.when})`
  }
}

const awards = new Section({
  title: "Awards Received",
  points: [
    new Award({
      title: "Best Overall Proof of Concept",
      from: "BYU FHTL Hackathon",
      when: "2020"
    }),
    new Award({
      title: "Eagle Scout",
      from: "BSA Grand Teton Council",
      when: "2014"
    }),
  ]
});

const skills = new Section({
  title: "My Skills",
  points: [
    new Point("Test Driven Development"),
    new Point("UI/UX Design"),
    new Point("CI/CD Pipelines"),
    new Point("Web Development"),
    new Point("Software Architecture"),
  ]
});

const tech = new Section({
  title: "Tech I Use",
  points: [
    new Point("HTML, CSS, JavaScript"),
    new Point("Angular, React, Vue"),
    new Point("AWS, MongoDB, SQL"),
    new Point("Java, C++, Python"),
    new Point("Mockito, OpenCV"),
    new Point("Git, Netlify, Terraform"),
    new Point("Android"),
  ]
});

class ExperienceGroup extends Section {
  constructor(title, sections) {
    super({title, sections})
  }
}

class ExperienceItem extends Section {
  constructor(props) {
    super(props);
    this.subtitle = props.place + " | " + props.span;
  }
}

let work = new ExperienceGroup("Work Experience", [
  new ExperienceItem({
    title: "Student Project Manager",
    place: "BYU Family History Tech Lab",
    span: "Oct 2018 - present",
    points: [
      new Point("Led a team 4-5 students to build and maintain several web applications."),
      new Point("Ensured production code quality with git workflows and code reviews."),
    ]
  }),
  new ExperienceItem({
    title: "Web Master",
    place: "SteadyTIDE Marketing",
    span: "Aug 2011 - Nov 2015",
    points: [
      new Point("Produced tailor-made websites for clients with in-person reviews."),
    ]
  }),
  new ExperienceItem({
    title: "Web Developer",
    place: "An Open Mind Counseling",
    span: "May 2010 - Aug 2014",
    points: [
      new Point("Improved company profits by designing and maintaining a lead generating website."),
    ]
  }),
]);



let school = new ExperienceGroup("Educational History", [
  new ExperienceItem({
    title: "BS in Computer Science",
    place: "Brigham Young University",
    span: "WIll graduate Apr 2022",
    points: [
      new Point("3.42 GPA"),
      new Point("Web Programming: Designed and deployed APIs and servers for modern web apps."),
      new Point("Software Engineering: Trained with modern tools for the development, testing, and deployment of reliable code."),
      new Point("Adv Programming Concepts: Applied industry standard design and tools to build functioning Java servers with Android clients."),
      new Point("Software Design: Leveraged advanced design patterns for clean, scalable architecture."),
      new Point("Test, Analysis, and Verification: Ensured software quality at each stage of the product life-cycle with testing and analysis."),
      new Point("UX Design: Innovated web and mobile interfaces based on targeted user research."),
    ]
  }),
  new ExperienceItem({
    title: "High School Diploma",
    place: "Century High School",
    span: "Apr 2015",
    points: [
      new Point("Graduated with Honors"),
    ]
  })
])

const defaultResumeData = {
  version: "0.1",
  fileName: "New Resume",
  showSummary: false,
  bio: {
    name: "Arthur Judd",
    subtitle: "Software Engineer, BS CS",
    summary: "I'm me!",
  },
  logo: "./images/logos/bracket_circle.png",
  sideSections: [contactOptions, skills, tech, awards],
  mainSections: [work, school]
}