import { Application, Router, send } from "./deps.ts"; 
import { client } from "./dbclient.ts";
import * as todoSql from "./todoSql.ts";

const router = new Router();
router.get("/", async (ctx) => {
  //context.response.body = { msg: "Hello world!" };
  await send(ctx, "/public/index.html", { root: `${Deno.cwd()}` });
});

router.get("/api/todos", async (context) => {
  await client.query(todoSql.selectSql()).then(
    (todos) => {
      console.log({ todos });
      context.response.body = todos;
    },
  ).catch(
    (errors) => {
      console.log({errors})
      context.response.body = { errors };
    },
  );
});

router.post("/api/todos", async (ctx) => {
  //console.log("has body : ",ctx.request.hasBody )
  const dtataPromise = await ctx.request.body(); //{ type: 'json' }
  const { text } = await dtataPromise.value;
  // if(!text){ errors }
  //console.log(text)
  ctx.response.body = {
    data: "null",
  };

  await client.query(todoSql.insertSql(text)).then(
    (dbFeedBack) => {
      //console.log({dbFeedBack})
      ctx.response.body = {
        id: dbFeedBack["lastInsertId"],
        text,
      };
    },
  ).catch(
    (errors) => ctx.response.body = { errors },
  );
});

router.delete("/api/todos/:id", async (context) => {
  // console.log("/api/todos/:id")
  // validate params context.params && context.params.id
  // validate bookwith id = incomming id exist in db
  if (context.params && context.params.id) {
    // assgn book id to the params
    const sql = todoSql.deleteByIdSql(parseInt(context.params.id));
    await client.query(sql).then(
      (resulet) => {
        if (!resulet)context.response.body = { message: "task not found" };
        else {
          console.log(resulet);
          // resulet["affectedRow"] > 1
          context.response.body = { resulet };
        }
      },
    ).catch(
      (errors) => context.response.body = { errors },
    );
  }
});

// router.get('/port',(ctx) => {ctx.response.body = {PORT:Deno.env.get("PORT")||"no port in env var"} }
// )

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods()); 

//await app.listen({ port: 8000 });
addEventListener("fetch", app.fetchEventHandler());
