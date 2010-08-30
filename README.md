

<img src="http://imgur.com/RcVnG.png" border="0"/>

# a collaborative bdd project planning tool for node


prenup allows you to meaningfully engage your clients and convert their domain knowledge into tangible milestones, features, scenarios, and unit tests.


## features

- Scenarios are created using [kyuri][1], a custom dialect of [Gherkin][12] geared towards asynchronous programming
- Intuitive and friendly user interface that takes the frustration out of Behavior Driven Development
- Generates [VowsJS][3] testing stubs (Vows is a well established node.js testing framework)
- Milestones, Features, Scenarios, Points
- Support for 160+ languages
- Heavily influenced by Cucumber. If you know [Cuke][10], you know prenup.


## things that would be implemented if we didn't build this in 48 hours

- real-time project management collaboration using [socket.io][9]
- user accounts using [roles.js][7]
- automated billing using [paynode][8]
- native mobile app (iPhone / iPad / BlackBerry) using [Titanium AppCelerator][6]

##Usage

### using prenup locally
<pre>
  git clone git@github.com:nodejitsu/prenup.git
  cd prenup
  node server.js
</pre>

### using prenup online

visit [http://prenup.nodejitsu.com][4]

## Vows

[VowsJS][3]  is a popular [Behavior Driven Development][4] framework for node.js. Vows was built from the ground up to test asynchronous code. It executes your tests in parallel when it makes sense, and sequentially when there are dependencies.

Instead of crafting your VowsJS code from hand (using JavaScript), kyuri allows you to auto-generate Vows stubs. 

## kyuri

[kyuri][1] comes pre-bundled with prenup. [kyuri][1] is the language used to describe your Features and Scenarios. [kyuri][1] is a dialect of Gherkin, a well establish BDD language made popular by [Cucumber][10]. 


## authors
### created for node knockout 2010 by The NYC Nodejitsu Ninjas
#### Charlie Robbins, hij1nx, Matthew Bergman & Marak Squires

### acknowledgments
Heavily inspired by Sean Cribbs' [Lowdownapp][4], an entry in the 2009 Rails Rumble


[1]:  http://github.com/nodejitsu/kyuri  "kyuri"
[2]:  http://cukes.info/    "Cucumber"
[3]:  http://vowsjs.org/  "Vowjs"
[4]:  http://lowdownapp.com/  "Lowdownapp"
[5]:  http://prenup.nodejitsu.com/ "prenup"
[6]:  http://www.appcelerator.com/ "Titanium AppCelerator"
[7]:  http://github.com/marak/roles.js/ "roles.js"
[8]:  http://github.com/jamescarr/paynode "paynode"
[9]:  http://socket.io/ "socket.io"
[10]: http://cukes.info "Cucumber"
[11]: http://nodejs.org "node.js"
[12]: http://wiki.github.com/aslakhellesoy/cucumber/gherkin "gherkin"
