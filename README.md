<a name="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/jhawkins11/doc-genie">
    <img src="public/logo.png" alt="Logo" style="background-color: black; padding: 5px; border-radius: 10px;">
  </a>

<h3 align="center">Doc Genie</h3>

  <p align="center">
    Co-create extensive documentation with GPT.
    <br />
    <br />
    <br />
    <a href="https://doc-genie.netlify.app">View Demo</a>
    ·
    <a href="https://github.com/jhawkins11/doc-genie/issues">Report Bug</a>
    ·
    <a href="https://github.com/jhawkins11/doc-genie/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#built-with">Built With</a>
    <li>
      <a href="#installation">Installation</a>
      <ul>
         <li><a href="#prerequisites">Prerequisites</a></li>
         <li><a href="#setup">Setup</a></li>
         <li><a href="#environment-variables">Environment Variables</a></li>
         <li><a href="#scripts">Scripts</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li>
      <a href="#roadmap">Roadmap</a>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li>
      <a href="#license">License</a>
    </li>
    <li>
      <a href="#acknowledgments">Acknowledgments</a>
    </li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

I wanted a way to utilize GPT's article generation and build out extensive documentation without having to endlessly prompt ChatGPT. The idea was to start with a high level topic and seamlessly generate a child article based on a subsection of the original article. This would create an intuitive way to quickly build out a document tree for the given topic.

As I developed the project, I decided to lean in to the co-creation aspect. I added the ability to prompt GPT directly to edit the article or generate an article on a specific subtopic not included in the parent article to build out the document tree exactly how they want it.

Ideally the next major feature would be the ability to link a code repo directly and generate high quality documentation from the source code.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

- [React](https://reactjs.org/) + [Next.js](https://nextjs.org/) - Frontend framework + Serverless API
- [JavaScript](https://www.javascript.com/) + [TypeScript](https://www.typescriptlang.org/) - Languages
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Material UI](https://material-ui.com/) - UI framework
- [Firebase](https://firebase.google.com/) - Authentication
- [MongoDB](https://www.mongodb.com/) - Database

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

The following steps will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm
- MongoDB
- Firebase

### Setup

1. Clone the repo
   `git clone https://github.com/jhawkins11/doc-genie.git`

2. Install dependencies
   npm install

3. Create a `.env.local` file in the root directory

### Environment Variables

In the `.env.local` file, add the following:

- `OPENAI_API_KEY` - Get this from your [OpenAI account](https://platform.openai.com/account/api-keys)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Get this from your [Firebase project settings](https://firebase.google.com/docs/web/setup#config-object)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `MONGODB_URI` - Follow docs to get MongoDB [connection string](https://docs.mongodb.com/guides/server/drivers/)

### Scripts

- `npm run dev` - start dev server
- `npm run build` - build for production
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Doc Genie allows you to quickly generate extensive documentation using AI. Follow these steps to get started:

1. Sign up and login.

2. On the homepage, enter a high-level topic to generate the initial doc.

[![Doc Genie Screen Shot][product-screenshot]](https://doc-genie.netlify.app)

3. Review the generated parent doc. If needed, click "Edit with GPT" at the bottom of the doc to prompt GPT to edit the doc.

4. Select a sub-section you want to expand on and click the lamp icon to generate a child doc. Alternatively, you can click the "+" icon to manually create a child doc for a custom child doc.

5. The child doc will be added to the document tree. Repeat steps 4-5 to keep building out the tree.

[![Doc Genie Screen Shot 2][product-screenshot-2]](https://doc-genie.netlify.app)

7. Access your generated docs anytime by clicking the profile icon in the top right corner and selecting "My Docs".

Some key features:

- Seamlessly generate a document tree with AI
- Manually create docs with custom prompts
- Edit generated docs with GPT
- Access generated docs anytime from your profile

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] View all generated article trees
- [ ] Edit/View mode
- [ ] Manual article editing
- [ ] Delete articles
- [ ] Subscription model
- [ ] Private articles
- [ ] Export to markdown/pdf
- [ ] Code repo integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Josiah Hawkins - [LinkedIn](https://www.linkedin.com/in/josiahhawkins/) - josiah.c.hawkins@gmail.com

Project Link: [https://github.com/jhawkins11/doc-genie](https://github.com/jhawkins11/doc-genie)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

- [OpenAI](https://openai.com/)
- [Next.js](https://nextjs.org/)
- [React.js](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Material UI](https://material-ui.com/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://www.mongodb.com/)
- [RafaelScopel](https://sketchfab.com/RafaelScopel)

[contributors-shield]: https://img.shields.io/github/contributors/jhawkins11/doc-genie.svg?style=for-the-badge
[contributors-url]: https://github.com/jhawkins11/doc-genie/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jhawkins11/doc-genie.svg?style=for-the-badge
[forks-url]: https://github.com/jhawkins11/doc-genie/network/members
[stars-shield]: https://img.shields.io/github/stars/jhawkins11/doc-genie.svg?style=for-the-badge
[stars-url]: https://github.com/jhawkins11/doc-genie/stargazers
[issues-shield]: https://img.shields.io/github/issues/jhawkins11/doc-genie.svg?style=for-the-badge
[issues-url]: https://github.com/jhawkins11/doc-genie/issues
[license-shield]: https://img.shields.io/github/license/jhawkins11/doc-genie.svg?style=for-the-badge
[license-url]: https://github.com/jhawkins11/doc-genie/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/josiahhawkins
[product-screenshot]: public/screenshot-1.png
[product-screenshot-2]: public/screenshot-2.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
