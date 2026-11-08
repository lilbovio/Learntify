# Guided projects

The first project is available at `/en/projects` and `/es/projects`. Its workspace uses the published `project-basket-total` curriculum identity, version 1. This keeps code drafts, attempt history, review scheduling and private notes on the existing owner-scoped, versioned infrastructure rather than adding parallel persistence.

The brief defines the input contract and exclusions. Four milestones guide planning, implementation, testing and reflection. Seven visible checks cover empty input, quantity multiplication, multiple items, zero quantity, free items, independent calls and input preservation. They evaluate function return values, so printing the expected output alone does not pass.

Code executes in QuickJS inside the existing dedicated Worker. The 16,000-character learner-code limit, 16 MiB VM limit, stack limit, one-second execution deadline, five-second host termination and bounded console output remain. Check expressions come from published curriculum, are limited to 20 cases and 2,000 characters each, and run in the same bounded VM. Results cross the VM boundary only as numeric values or fixed error descriptions. A code edit or account change clears prior results.

These checks are formative, visible and not tamper-proof. Learners can inspect or game them; they are not authoritative grading, comprehensive property testing, or a certificate. Saved attempts retain the code and the client-reported aggregate match flag; individual case results are rerun, not stored. Invalid inputs, unsafe integer totals and currency formatting are excluded explicitly from this project.

The interview walkthrough asks learners to clarify requirements, trace an example, describe a failure, discuss complexity/tradeoffs and choose a next improvement. Signed-in learners can record this reflection in the project's private lesson notes and revisit it in Notebook. Guest code saves locally; guest reflections are not persisted. Milestones are instructional steps, not saved completion checkboxes. There are no AI scores, recordings, timers, peer matching or simulated interviewers.

Browser tests cover passing/incorrect implementations, printed-output cheating, mutation, runaway execution recovery, Spanish mobile layout, and account-backed code/attempt/note persistence. The compiled-client suite also runs project journeys to check the deployed Worker/WASM asset paths without publishing anything.
