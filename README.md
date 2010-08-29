# Nuptials

##A project planning tool that allows you to meaningfully engage your clients and convert their domain knowledge into tangible milestones, features, scenarions, and unit tests.

## Features

- Scenarios are created using Kyuri, a custom dialect of Gherkin geared towards asynchronous programming
- Heavily influenced by Cucumber. If you know Cuke, you know Nuptials.
- Generates VowsJS testing stubs (VowsJS is a well established node.js testing framework)
- Intuitive and friendly user interface that takes the frustration out of Behavior Driven Development
- Milestones, Features, Scenarios, Points
- Support for 160+ languages


## Using Nuptials

Nuptials can be used as a software as a service located @ http://foo.com.

Nuptials is also open-source, so you can run your own customizable version (see below)


## Installation

If you want to run your own Nuptials instance (instead of using the free service available at http://foo.com), you will need to install Nuptials via npm.


### Installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### Installing nuptials
<pre>
  npm install nuptials
</pre>


## VowsJS

Vows is a popular behavior driven development framework for Node.js. [Vows][3] was built from the ground up to test asynchronous code. It executes your tests in parallel when it makes sense, and sequentially when there are dependencies.

Instead of crafting your [Vows][3] code from hand (using JavaScript), Nuptials allows you to auto-generate Vows stubs. 

For further information about [Vows][3], please visit it's repository here. 

## Kyuri

[Kyuri][1] comes pre-bundled with Nuptials. [Kyuri][1] is the language used to describe your Features and Scenarios. [Kyuri][1] is a dialect of Gherkin, a well establish BDD language made popular by the Cucumber framework. 

For further information about [Kyuri][1], please visit it's repository here.


## Authors
### Created for Node Knockout 2010 by The NYC Nodejitsu Ninjas
#### Charlie Robbins, hij1nx, Matthew Bergman & Marak Squires

### Acknowledgments
Heavily inspired by Sean Cribbs' [Lowdownapp][4], an entry in the 2009 Rails Rumble

Cucumber works via plain text descriptions of how your software should work. 
Learn more about [Cucumber][2].

Think testing business logic with all the tastiness of organizing via easily readable steps.

[1]:  http://github.com/nodejitsu/kyuri  "Kyuri"
[2]:  http://cukes.info/    "Cucumber"
[3]:  http://vowsjs.org/  "Vowjs"
[4]:  http://lowdownapp.com/  "Lowdownapp"
[5]:  http://foo.com/ "nuptials"